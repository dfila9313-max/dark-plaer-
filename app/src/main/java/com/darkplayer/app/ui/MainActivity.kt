package com.darkplayer.app.ui

import android.Manifest
import android.content.*
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.provider.MediaStore
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.darkplayer.app.R
import com.darkplayer.app.databinding.ActivityMainBinding
import com.darkplayer.app.model.Song
import com.darkplayer.app.service.MusicService

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var musicService: MusicService? = null
    private var bound = false
    private var songAdapter: SongAdapter? = null
    private var isEqualizerVisible = false

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            val binder = service as MusicService.MusicBinder
            musicService = binder.getService()
            bound = true
            setupServiceCallbacks()
            loadSongs()
        }
        override fun onServiceDisconnected(name: ComponentName) { bound = false }
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) loadSongs()
        else Toast.makeText(this, "Нужен доступ к файлам", Toast.LENGTH_LONG).show()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setupUI()
        bindMusicService()
        checkPermission()
    }

    private fun setupUI() {
        binding.recyclerSongs.layoutManager = LinearLayoutManager(this)
        binding.btnPlayPause.setOnClickListener { musicService?.playPause() }
        binding.btnNext.setOnClickListener { musicService?.playNext() }
        binding.btnPrev.setOnClickListener { musicService?.playPrevious() }
        binding.seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar, progress: Int, fromUser: Boolean) {
                if (fromUser) musicService?.seekTo(progress)
            }
            override fun onStartTrackingTouch(sb: SeekBar) {}
            override fun onStopTrackingTouch(sb: SeekBar) {}
        })
        binding.btnEqualizer.setOnClickListener {
            isEqualizerVisible = !isEqualizerVisible
            binding.equalizerLayout.visibility = if (isEqualizerVisible)
                android.view.View.VISIBLE else android.view.View.GONE
        }
        setupEqualizerBands()
    }

    private fun setupEqualizerBands() {
        val seekBars = listOf(binding.eqBand0, binding.eqBand1, binding.eqBand2, binding.eqBand3, binding.eqBand4)
        seekBars.forEachIndexed { index, sb ->
            sb.max = 3000
            sb.progress = 1500
            sb.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(seekBar: SeekBar, progress: Int, fromUser: Boolean) {
                    if (fromUser) musicService?.setEqualizerBand(index.toShort(), (progress - 1500).toShort())
                }
                override fun onStartTrackingTouch(sb: SeekBar) {}
                override fun onStopTrackingTouch(sb: SeekBar) {}
            })
        }
    }

    private fun setupServiceCallbacks() {
        musicService?.onSongChanged = { song ->
            runOnUiThread {
                if (song != null) {
                    binding.tvTitle.text = song.title
                    binding.tvArtist.text = song.artist
                    binding.tvDuration.text = song.durationFormatted
                    binding.seekBar.max = song.duration.toInt()
                    songAdapter?.setCurrentSong(song.id)
                    updateEqualizerBands()
                }
            }
        }
        musicService?.onPlayStateChanged = { playing ->
            runOnUiThread {
                binding.btnPlayPause.setImageResource(
                    if (playing) R.drawable.ic_pause else R.drawable.ic_play
                )
            }
        }
        musicService?.onProgressChanged = { position, _ ->
            runOnUiThread {
                binding.seekBar.progress = position
                binding.tvCurrentTime.text = formatTime(position)
            }
        }
    }

    private fun updateEqualizerBands() {
        val eq = musicService?.equalizer ?: return
        val seekBars = listOf(binding.eqBand0, binding.eqBand1, binding.eqBand2, binding.eqBand3, binding.eqBand4)
        try {
            for (i in 0 until minOf(eq.numberOfBands.toInt(), 5)) {
                seekBars[i].progress = eq.getBandLevel(i.toShort()) + 1500
            }
        } catch (e: Exception) {}
    }

    private fun loadSongs() {
        val service = musicService ?: return
        val songs = mutableListOf<Song>()
        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
            MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
        else MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        val projection = arrayOf(
            MediaStore.Audio.Media._ID, MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST, MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.DURATION, MediaStore.Audio.Media.ALBUM_ID
        )
        contentResolver.query(collection, projection, "${MediaStore.Audio.Media.IS_MUSIC} != 0",
            null, "${MediaStore.Audio.Media.TITLE} ASC")?.use { cursor ->
            val idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
            val durCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            val albumIdCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
            while (cursor.moveToNext()) {
                val id = cursor.getLong(idCol)
                val albumId = cursor.getLong(albumIdCol)
                songs.add(Song(id, cursor.getString(titleCol) ?: "Unknown",
                    cursor.getString(artistCol) ?: "Unknown", cursor.getString(albumCol) ?: "Unknown",
                    cursor.getLong(durCol),
                    ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id),
                    Uri.parse("content://media/external/audio/albumart/$albumId")))
            }
        }
        service.songs = songs
        songAdapter = SongAdapter(songs) { index -> service.playSong(index) }
        binding.recyclerSongs.adapter = songAdapter
        binding.tvEmpty.visibility = if (songs.isEmpty()) android.view.View.VISIBLE else android.view.View.GONE
    }

    private fun checkPermission() {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            Manifest.permission.READ_MEDIA_AUDIO else Manifest.permission.READ_EXTERNAL_STORAGE
        if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED)
            permissionLauncher.launch(permission)
    }

    private fun bindMusicService() {
        val intent = Intent(this, MusicService::class.java)
        startService(intent)
        bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }

    private fun formatTime(ms: Int): String {
        val minutes = ms / 1000 / 60
        val seconds = (ms / 1000) % 60
        return "%d:%02d".format(minutes, seconds)
    }

    override fun onDestroy() {
        if (bound) unbindService(connection)
        super.onDestroy()
    }
}
