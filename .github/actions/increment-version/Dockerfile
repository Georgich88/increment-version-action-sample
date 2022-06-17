FROM alpine:3.10
COPY increment-version.sh /usr/bin/increment-version.sh
RUN apk add --no-cache --upgrade bash
RUN chmod +x /usr/bin/increment-version.sh
ENTRYPOINT ["/usr/bin/increment-version.sh"]