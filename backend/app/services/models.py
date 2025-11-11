from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column
from sqlalchemy import String, Integer, Float, ForeignKey, UniqueConstraint

Base = declarative_base()


class Song(Base):
    __tablename__ = "songs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(256))
    artist: Mapped[str] = mapped_column(String(256))
    features: Mapped["FeatureVector"] = relationship("FeatureVector", back_populates="song", uselist=False)
    cluster: Mapped["ClusterAssignment"] = relationship("ClusterAssignment", back_populates="song", uselist=False)


class FeatureVector(Base):
    __tablename__ = "feature_vectors"
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"), primary_key=True)
    energy: Mapped[float] = mapped_column(Float)
    valence: Mapped[float] = mapped_column(Float)
    danceability: Mapped[float] = mapped_column(Float)
    tempo: Mapped[float] = mapped_column(Float)
    song: Mapped[Song] = relationship("Song", back_populates="features")


class ClusterAssignment(Base):
    __tablename__ = "cluster_assignments"
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"), primary_key=True)
    cluster: Mapped[int] = mapped_column(Integer)
    song: Mapped[Song] = relationship("Song", back_populates="cluster")
    __table_args__ = (UniqueConstraint("song_id"),)

