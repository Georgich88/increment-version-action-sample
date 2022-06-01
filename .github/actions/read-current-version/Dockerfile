FROM alpine:3.10
COPY read-current-version.sh /usr/bin/
RUN apk add --no-cache bash
RUN ln -s /usr/bin/read-current-version.sh
ENTRYPOINT ["read-current-version.sh"]