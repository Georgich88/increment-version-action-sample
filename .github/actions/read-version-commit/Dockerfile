FROM alpine:3.10
COPY read-version-commit.sh /usr/bin/read-version-commit.sh
RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache --upgrade git
RUN chmod +x /usr/bin/read-version-commit.sh
ENTRYPOINT ["/usr/bin/read-version-commit.sh"]
