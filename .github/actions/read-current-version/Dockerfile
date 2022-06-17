FROM alpine:3.10
COPY read-current-version.sh /usr/bin/read-current-version.sh
RUN apk add --no-cache --upgrade bash
RUN chmod +x /usr/bin/read-current-version.sh
ENTRYPOINT ["/usr/bin/read-current-version.sh"]