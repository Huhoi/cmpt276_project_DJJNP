package cmpt276.project.djjnp.projectdjjnp.models;


import jakarta.persistence.*;

@Entity
@Table(name = "events")
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int sid;
    private int uid;
    private String eventName; // replace with location/event from map API
    private String latitude;
    private String longitude;
    private String date;
    private int timeBegin;
    private int timeEnd;
    
    

    public Event() {
    }

    public Event(int uid, String eventName, String latitude, String longitude, int timeBegin, int timeEnd, String date) {
        this.uid = uid;
        this.eventName = eventName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timeBegin = timeBegin;
        this.timeEnd = timeEnd;
        this.date = date;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
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

    public int getTimeBegin() {
        return timeBegin;
    }

    public void setTimeBegin(int timeBegin) {
        this.timeBegin = timeBegin;
    }

    public int getTimeEnd() {
        return timeEnd;
    }

    public void setTimeEnd(int timeEnd) {
        this.timeEnd = timeEnd;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getSid() {
        return sid;
    }

    public void setSid(int sid) {
        this.sid = sid;
    }

    public int getUid() {
        return uid;
    }

    public void setUid(int uid) {
        this.uid = uid;
    }

    

   

}

