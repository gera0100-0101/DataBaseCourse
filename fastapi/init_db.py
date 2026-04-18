from database import engine, Base
import models

print("Tables registered:")
print(Base.metadata.tables.keys())

Base.metadata.create_all(bind=engine)

print("done")