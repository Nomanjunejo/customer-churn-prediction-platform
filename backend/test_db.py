
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL missing. Check your .env file."
    )

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

try:
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT version()")
        )
        print("Database connection successful!")
        print(result.scalar())

except Exception as error:
    print("Database connection failed:")
    print(error)

finally:
    engine.dispose()
