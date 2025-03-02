# Use the official Rasa image (adjust the tag/version as needed)
FROM rasa/rasa:latest-full

# Set the working directory inside the container
WORKDIR /app

# Copy all project files into the container
COPY . .

# Train the model (optional if you’ve already trained, but ensures the latest data)
# RUN rasa train

# Expose the port Rasa will run on
EXPOSE 5005

# Run Rasa with API enabled and CORS open (adjust CORS value if needed)
CMD ["run", "--enable-api", "--cors", "*", "--debug"]