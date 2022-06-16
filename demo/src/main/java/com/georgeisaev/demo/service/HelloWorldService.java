package com.georgeisaev.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class HelloWorldService {

  Logger log = LoggerFactory.getLogger(HelloWorldService.class);

  public void sayHello() {
    log.info("Hello world");
  }
}
