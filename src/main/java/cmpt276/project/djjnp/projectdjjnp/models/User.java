package cmpt276.project.djjnp.projectdjjnp.models;

import jakarta.persistence.*;


// Database Table
@Entity
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int uid;
    private String email;
    private String password;

    public User(){}
    public User(String email, String password){
        this.email = email;
        this.password = password;
    }

    // Getters and Setters for variables
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public int getUid() {
        return uid;
    }
    public void setUid(int uid) {
        this.uid = uid;
    }
    
    
}
