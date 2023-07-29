package cmpt276.project.djjnp.projectdjjnp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="share")
public class ShareLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int shareid;
    private int uid;
    private String shareToken;
    private LocalDateTime expirationTimestamp;
    
    public ShareLink() {
    }

    public ShareLink(int uid, String shareToken, LocalDateTime expirationTimestamp) {
        this.uid = uid;
        this.shareToken = shareToken;
        this.expirationTimestamp = expirationTimestamp;
    }

    public int getUid() {
        return uid;
    }

    public void setUid(int uid) {
        this.uid = uid;
    }

    public String getShareToken() {
        return shareToken;
    }

    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }

    public LocalDateTime getExpirationTimestamp() {
        return expirationTimestamp;
    }

    public void setExpirationTimestamp(LocalDateTime expirationTimestamp) {
        this.expirationTimestamp = expirationTimestamp;
    }

    public int getShare_id() {
        return shareid;
    }

    public void setShare_id(int share_id) {
        this.shareid = shareid;
    }

    @Override
    public String toString() {
        return "ShareLink [id=" + shareid + ", shareToken=" + shareToken + ", uid=" + uid + "]";
    }

    
    
}
