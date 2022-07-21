FROM alpine:3.10
COPY commit-next-version.sh /usr/bin/commit-next-version.sh
RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache --upgrade git
RUN apk --no-cache add curl
RUN apk add github-cli
RUN chmod +x /usr/bin/commit-next-version.sh
ENTRYPOINT ["/usr/bin/commit-next-version.sh"]
