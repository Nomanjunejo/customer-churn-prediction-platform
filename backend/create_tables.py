
from backend.database import Base, engine
from backend import models  # Register the table definitions

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")
