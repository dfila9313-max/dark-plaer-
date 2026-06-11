package com.darkplayer.app.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.darkplayer.app.R
import com.darkplayer.app.model.Song

class SongAdapter(
    private val songs: List<Song>,
    private val onSongClick: (Int) -> Unit
) : RecyclerView.Adapter<SongAdapter.SongViewHolder>() {

    private var currentSongId: Long = -1

    fun setCurrentSong(id: Long) {
        val oldIndex = songs.indexOfFirst { it.id == currentSongId }
        val newIndex = songs.indexOfFirst { it.id == id }
        currentSongId = id
        if (oldIndex >= 0) notifyItemChanged(oldIndex)
        if (newIndex >= 0) notifyItemChanged(newIndex)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SongViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_song, parent, false)
        return SongViewHolder(view)
    }

    override fun onBindViewHolder(holder: SongViewHolder, position: Int) {
        holder.bind(songs[position], position)
    }

    override fun getItemCount() = songs.size

    inner class SongViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvTitle: TextView = itemView.findViewById(R.id.tvSongTitle)
        private val tvArtist: TextView = itemView.findViewById(R.id.tvSongArtist)
        private val tvDuration: TextView = itemView.findViewById(R.id.tvSongDuration)
        private val ivPlaying: ImageView = itemView.findViewById(R.id.ivPlaying)

        fun bind(song: Song, position: Int) {
            tvTitle.text = song.title
            tvArtist.text = song.artist
            tvDuration.text = song.durationFormatted
            val isPlaying = song.id == currentSongId
            ivPlaying.visibility = if (isPlaying) View.VISIBLE else View.INVISIBLE
            itemView.setBackgroundResource(
                if (isPlaying) R.drawable.bg_song_active else R.drawable.bg_song_normal
            )
            itemView.setOnClickListener { onSongClick(position) }
        }
    }
}
