FROM python:3.12.4 


# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install  -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8003

# Optional: default command (adjust to your entrypoint)
CMD ["python", "main.py"]

