import io
import json
import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="RhytmX Prototype", layout="wide", page_icon="🎵")

st.title("RhytmX — Mood Map Prototype")

col1, col2 = st.columns([3,2])

with col2:
	st.subheader("Filters")
	energy_range = st.slider("Energy", 0.0, 1.0, (0.0, 1.0), 0.01)
	valence_range = st.slider("Valence", 0.0, 1.0, (0.0, 1.0), 0.01)
	k_clusters = st.slider("Clusters (KMeans)", 2, 30, 12)

with col1:
	st.subheader("Mood Map")
	N = 400
	np.random.seed(7)
	df = pd.DataFrame({
		"energy": np.random.rand(N),
		"valence": np.random.rand(N),
		"title": [f"Track {i}" for i in range(N)],
		"artist": np.random.choice(["Indie Echo","LoWave","Nocturne Lab","VibeCraft"], N)
	})
	df = df[(df.energy.between(*energy_range)) & (df.valence.between(*valence_range))]
	fig = px.scatter(df, x="energy", y="valence", color_discrete_sequence=["#FF7F50"], hover_data=["title","artist"]) 
	fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
	st.plotly_chart(fig, use_container_width=True)

st.subheader("Generated Playlist")
playlist = df.sample(min(20, len(df))).reset_index(drop=True)
st.dataframe(playlist[["title","artist","energy","valence"]])

buf = io.StringIO()
playlist.to_csv(buf, index=False)
st.download_button("Download CSV", buf.getvalue(), file_name="rhytmx_playlist.csv", mime="text/csv")

