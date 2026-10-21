package com.ghayeth.taskflow.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;

/**
 * Application user. The password column always stores a BCrypt hash,
 * never a plain-text password.
 */
@Entity
@Table(name = "app_user")
public class User {

    @Id
    @Size(max = 50)
    private String username;

    @Column(nullable = false)
    @Size(max = 100)
    private String password;

    private boolean enabled = true;

    protected User() {
        // for JPA
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
