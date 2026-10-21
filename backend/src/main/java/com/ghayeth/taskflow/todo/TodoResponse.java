package com.ghayeth.taskflow.todo;

import java.time.LocalDate;

public record TodoResponse(Long id, String description, boolean done, LocalDate targetDate) {

    public static TodoResponse from(Todo todo) {
        return new TodoResponse(todo.getId(), todo.getDescription(), todo.isDone(), todo.getTargetDate());
    }
}
