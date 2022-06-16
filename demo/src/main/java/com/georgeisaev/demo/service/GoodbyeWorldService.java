package com.georgeisaev.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class GoodbyeWorldService {

  Logger log = LoggerFactory.getLogger(GoodbyeWorldService.class);

  public void sayHello() {
    log.info("Goodbye world");
  }
}
