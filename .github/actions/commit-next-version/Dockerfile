FROM alpine:3.10
COPY commit-next-version.sh /usr/bin/commit-next-version.sh
RUN apk add --no-cache --upgrade bash
RUN apk add --no-cache --upgrade git
RUN apk --no-cache add curl
RUN curl -Lo tmp/ghlinux.tar.gz \
  https://github.com/cli/cli/releases/download/v2.10.1/gh_2.10.1_linux_amd64.tar.gz \
  && tar --strip-components=1 -xf tmp/ghlinux.tar.gz \
  && rm tmp/ghlinux.tar.gz
RUN chmod +x /usr/bin/commit-next-version.sh
ENTRYPOINT ["/usr/bin/commit-next-version.sh"]
