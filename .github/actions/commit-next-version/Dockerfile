FROM alpine:3.10
COPY commit-next-version.sh /usr/bin/
RUN apk add --no-cache bash
RUN ln -s /usr/bin/commit-next-version.sh
ENTRYPOINT ["commit-next-version.sh"]