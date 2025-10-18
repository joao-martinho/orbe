package br.furb.orbe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OrbeApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrbeApplication.class, args);
	}

}
