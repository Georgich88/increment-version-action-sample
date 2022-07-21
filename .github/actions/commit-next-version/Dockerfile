FROM alpine:3.10
COPY commit-next-version.sh /usr/bin/commit-next-version.sh
RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache --upgrade git
RUN apk --no-cache add curl
RUN curl -Lo /usr/bin/ghlinux.tar.gz \
  https://github.com/cli/cli/releases/download/v2.10.1/gh_2.10.1_linux_amd64.tar.gz \
  && tar --strip-components=1 -xf /usr/bin/ghlinux.tar.gz \
  && rm /usr/bin/ghlinux.tar.gz
RUN chmod +x /usr/bin/commit-next-version.sh
ENTRYPOINT ["/usr/bin/commit-next-version.sh"]
