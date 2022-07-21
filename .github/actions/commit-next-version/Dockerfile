FROM ubuntu:18.04
COPY commit-next-version.sh /usr/bin/commit-next-version.sh
RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y curl
RUN apt-get install -y gh
RUN chmod +x /usr/bin/commit-next-version.sh
ENTRYPOINT ["/usr/bin/commit-next-version.sh"]
