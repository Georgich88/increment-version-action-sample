FROM ubuntu:latest
COPY commit-next-version.sh /usr/bin/commit-next-version.sh
RUN sudo apt-get update
RUN sudo apt-get install -y git
RUN sudo apt-get install -y curl
RUN sudo apt-get install -y gh
RUN chmod +x /usr/bin/commit-next-version.sh
ENTRYPOINT ["/usr/bin/commit-next-version.sh"]
