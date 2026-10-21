package com.ghayeth.taskflow.todo;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TodoRequest(
        @NotBlank @Size(min = 3, max = 200) String description,
        boolean done,
        @NotNull LocalDate targetDate) {
}
