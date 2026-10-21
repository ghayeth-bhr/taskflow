package com.ghayeth.taskflow.todo;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "todo")
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owner username; denormalized on purpose so every query can be scoped. */
    @Column(nullable = false, updatable = false)
    private String owner;

    @NotBlank
    @Size(min = 3, max = 200)
    private String description;

    private boolean done;

    @NotNull
    private LocalDate targetDate;

    protected Todo() {
        // for JPA
    }

    public Todo(String owner, String description, boolean done, LocalDate targetDate) {
        this.owner = owner;
        this.description = description;
        this.done = done;
        this.targetDate = targetDate;
    }

    public Long getId() {
        return id;
    }

    public String getOwner() {
        return owner;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }
}
