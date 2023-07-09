package cmpt276.project.djjnp.projectdjjnp.models;

import java.util.List;

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
    // private List<Event> events;

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
    // public List<Event> getAllEvents() {
    //     return events;
    // }
    // public void addEvent(Event event) {
    //     events.add(event);
    // }
    // public void removeEvent(Event event){
    //     for (int i = 0; i < events.size(); i++){
    //         if (event.equals(events.get(i))){
    //             events.remove(i);
    //             return;
    //         }
    //     }
    // }

    
    
}
