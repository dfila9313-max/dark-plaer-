package com.darkplayer.app.service

import android.app.*
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.audiofx.Equalizer
import android.os.Binder
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.darkplayer.app.R
import com.darkplayer.app.model.Song
import com.darkplayer.app.ui.MainActivity

class MusicService : Service() {
    private val binder = MusicBinder()
    private var mediaPlayer: MediaPlayer? = null
    var equalizer: Equalizer? = null
        private set

    var songs: List<Song> = emptyList()
    var currentIndex: Int = -1
        private set

    var onSongChanged: ((Song?) -> Unit)? = null
    var onPlayStateChanged: ((Boolean) -> Unit)? = null
    var onProgressChanged: ((Int, Int) -> Unit)? = null

    private val CHANNEL_ID = "DarkPlayerChannel"
    private val NOTIF_ID = 1
    private var progressRunnable: Runnable? = null
    private val handler = android.os.Handler(android.os.Looper.getMainLooper())

    inner class MusicBinder : Binder() {
        fun getService(): MusicService = this@MusicService
    }

    override fun onBind(intent: Intent): IBinder = binder

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    fun playSong(index: Int) {
        if (index < 0 || index >= songs.size) return
        currentIndex = index
        val song = songs[index]
        mediaPlayer?.release()
        mediaPlayer = MediaPlayer().apply {
            setAudioAttributes(AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .setUsage(AudioAttributes.USAGE_MEDIA).build())
            setDataSource(applicationContext, song.uri)
            prepare()
            start()
            setOnCompletionListener { playNext() }
        }
        setupEqualizer()
        startProgressUpdates()
        onSongChanged?.invoke(song)
        onPlayStateChanged?.invoke(true)
        showNotification(song)
    }

    private fun setupEqualizer() {
        equalizer?.release()
        val sessionId = mediaPlayer?.audioSessionId ?: return
        if (sessionId == AudioManager.ERROR) return
        equalizer = Equalizer(0, sessionId).apply { enabled = true }
    }

    fun playPause() {
        mediaPlayer?.let {
            if (it.isPlaying) { it.pause(); onPlayStateChanged?.invoke(false) }
            else { it.start(); onPlayStateChanged?.invoke(true) }
        }
    }

    fun playNext() {
        if (songs.isEmpty()) return
        playSong((currentIndex + 1) % songs.size)
    }

    fun playPrevious() {
        if (songs.isEmpty()) return
        playSong(if (currentIndex <= 0) songs.size - 1 else currentIndex - 1)
    }

    fun seekTo(position: Int) { mediaPlayer?.seekTo(position) }
    fun isPlaying(): Boolean = mediaPlayer?.isPlaying == true
    fun getCurrentPosition(): Int = mediaPlayer?.currentPosition ?: 0
    fun getDuration(): Int = mediaPlayer?.duration ?: 0
    fun setEqualizerBand(band: Short, level: Short) { equalizer?.setBandLevel(band, level) }

    private fun startProgressUpdates() {
        progressRunnable?.let { handler.removeCallbacks(it) }
        progressRunnable = object : Runnable {
            override fun run() {
                mediaPlayer?.let { if (it.isPlaying) onProgressChanged?.invoke(it.currentPosition, it.duration) }
                handler.postDelayed(this, 500)
            }
        }
        handler.post(progressRunnable!!)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(CHANNEL_ID, "DarkPlayer", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java).createNotificationChannel(ch)
        }
    }

    private fun showNotification(song: Song) {
        val pi = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        startForeground(NOTIF_ID, NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(song.title).setContentText(song.artist)
            .setSmallIcon(R.drawable.ic_music_note).setContentIntent(pi).setOngoing(true).build())
    }

    override fun onDestroy() {
        progressRunnable?.let { handler.removeCallbacks(it) }
        equalizer?.release(); mediaPlayer?.release()
        super.onDestroy()
    }
}
