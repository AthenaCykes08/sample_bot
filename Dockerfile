# Use the official Rasa image (adjust the tag/version as needed)
FROM rasa/rasa:latest-full

# Set the working directory inside the container
WORKDIR /app

# Copy all project files into the container
COPY --chown=rasa:rasa . .

# Change ownership of all files in /app to the 'rasa' user
# RUN chown -R rasa:rasa /app

# Setting the port environment variable - currently commenting this out because I'm not sure how useful it will be
# ENV PORT 5005

# Train the model (optional if you’ve already trained, but ensures the latest data)
RUN rasa train

# Expose the port Rasa will run on
EXPOSE $PORT

# Run Rasa with API enabled and CORS open (adjust CORS value if needed)
CMD ["rasa", "run", "--enable-api", "--cors", "*", "--port", "$PORT", "--debug"]
