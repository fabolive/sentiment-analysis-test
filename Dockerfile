# Set the base image to Ubuntu
FROM ubuntu

# Add the application resources URL
#RUN echo "deb http://us.archive.ubuntu.com/ubuntu/ $(lsb_release -sc) main universe" >> /etc/apt/sources.list

# Update the sources list
RUN apt-get update

# Install basic applications
#RUN apt-get install -y tar git curl nano wget dialog net-tools build-essential

# Install Python and Basic Python Tools
RUN apt-get install -y python python-dev python-distribute python-pip

RUN mkdir -p /sentiment-analysis-python/public
RUN mkdir -p /sentiment-analysis-python/templates

# Copy the application folder inside the container
ADD public /sentiment-analysis-python/public
ADD templates /sentiment-analysis-python/templates
ADD server.py requirements.txt /sentiment-analysis-python/
# Get pip to download and install requirements:
RUN pip install -r /sentiment-analysis-python/requirements.txt

# Expose ports
EXPOSE 10000

# Set the default directory where CMD will execute
WORKDIR /sentiment-analysis-python

# Set the default command to execute    
# when creating a new container
# i.e. using CherryPy to serve the application
CMD python server.py
