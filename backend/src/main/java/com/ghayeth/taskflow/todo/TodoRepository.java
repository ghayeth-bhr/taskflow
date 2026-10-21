package com.ghayeth.taskflow.todo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    List<Todo> findByOwnerOrderByTargetDateAsc(String owner);

    Optional<Todo> findByIdAndOwner(Long id, String owner);
}
