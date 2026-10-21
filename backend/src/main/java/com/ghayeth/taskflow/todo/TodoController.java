package com.ghayeth.taskflow.todo;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

/**
 * Per-user todo CRUD.
 *
 * Security model: the owner is ALWAYS taken from the JWT subject, never from
 * the URL or the request body. Combined with owner-scoped repository queries,
 * a user simply cannot observe or touch another user's todos (they get 404,
 * which also avoids leaking the existence of foreign resources).
 */
@RestController
@RequestMapping("/api/todos")
@PreAuthorize("hasRole('USER')")
public class TodoController {

    private final TodoRepository todoRepository;

    public TodoController(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    @GetMapping
    public List<TodoResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return todoRepository.findByOwnerOrderByTargetDateAsc(jwt.getSubject())
                .stream()
                .map(TodoResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public TodoResponse retrieve(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return TodoResponse.from(findOwnTodo(jwt, id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TodoResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody TodoRequest request) {
        Todo todo = new Todo(jwt.getSubject(), request.description(), request.done(), request.targetDate());
        return TodoResponse.from(todoRepository.save(todo));
    }

    @PutMapping("/{id}")
    public TodoResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
            @Valid @RequestBody TodoRequest request) {
        Todo todo = findOwnTodo(jwt, id);
        todo.setDescription(request.description());
        todo.setDone(request.done());
        todo.setTargetDate(request.targetDate());
        return TodoResponse.from(todoRepository.save(todo));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        todoRepository.delete(findOwnTodo(jwt, id));
    }

    private Todo findOwnTodo(Jwt jwt, Long id) {
        return todoRepository.findByIdAndOwner(id, jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found"));
    }
}
