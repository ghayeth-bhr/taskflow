package com.ghayeth.taskflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ghayeth.taskflow.todo.Todo;
import com.ghayeth.taskflow.todo.TodoRepository;
import com.ghayeth.taskflow.user.User;
import com.ghayeth.taskflow.user.UserRepository;

import java.time.LocalDate;

/**
 * Seeds the demo account (and a couple of starter todos) on first start-up,
 * so a fresh clone is immediately usable.
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TodoRepository todoRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${taskflow.seed.username}")
    private String seedUsername;

    @Value("${taskflow.seed.password}")
    private String seedPassword;

    public DataInitializer(UserRepository userRepository, TodoRepository todoRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.todoRepository = todoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsById(seedUsername)) {
            return;
        }

        userRepository.save(new User(seedUsername, passwordEncoder.encode(seedPassword)));

        todoRepository.save(new Todo(seedUsername, "Explore the TaskFlow REST API", false,
                LocalDate.now().plusDays(7)));
        todoRepository.save(new Todo(seedUsername, "Write the PFE report outline", false,
                LocalDate.now().plusDays(30)));

        log.info("Seeded demo account '{}' with starter todos (password from taskflow.seed.password)",
                seedUsername);
    }
}
