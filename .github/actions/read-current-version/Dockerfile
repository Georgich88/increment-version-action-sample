#FROM alpine:3.10
#COPY read-current-version.sh /usr/bin/read-current-version.sh
#RUN apk add --no-cache bash
#RUN ln -s /usr/bin/read-current-version.sh
#ENTRYPOINT ["/usr/bin/read-current-version.sh"]

# Container image that runs your code
FROM alpine:3.10

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY read-current-version.sh /read-current-version.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["read-current-version.sh"]