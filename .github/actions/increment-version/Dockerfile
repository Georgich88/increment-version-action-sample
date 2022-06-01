FROM alpine:3.10
COPY increment-version.sh /usr/bin/
RUN apk add --no-cache bash
RUN ln -s /usr/bin/increment-version.sh
ENTRYPOINT ["increment-version.sh"]