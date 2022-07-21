FROM alpine:3.16
COPY commit-next-version.sh /usr/bin/commit-next-version.sh
RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache --upgrade git
RUN apk add --no-cache --upgrade curl
RUN apk add --no-cache --upgrade github-cli
RUN git config --global --add safe.directory '*'
RUN chmod +x /usr/bin/commit-next-version.sh
ENTRYPOINT ["/usr/bin/commit-next-version.sh"]
