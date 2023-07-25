package cmpt276.project.djjnp.projectdjjnp.models;

import jakarta.persistence.*;

@Entity
@Table(name = "location")
public class Location {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int lid;
    private int uid;
    private int sid;
    private String timestamp; //Name of Markers on Map 
    private String latitude; 
    private String longitude;
    private String description;

    public Location() {
    }

    public Location(int uid, String timestamp, String latitude, String longitude, String description) {
        this.uid = uid;
        this.timestamp = timestamp;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;

    }

    public int getLid() {
        return lid;
    }

    public void setLid(int lid) {
        this.lid = lid;
    }

    public int getUid() {
        return uid;
    }

    public void setUid(int uid) {
        this.uid = uid;
    }

    public int getSid() {
        return sid;
    }

    public void setSid(int sid) {
        this.sid = sid;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getLatitude() {
        return latitude;
    }

    public void setLatitude(String latitude) {
        this.latitude = latitude;
    }

    public String getLongitude() {
        return longitude;
    }

    public void setLongitude(String longitude) {
        this.longitude = longitude;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    
}
