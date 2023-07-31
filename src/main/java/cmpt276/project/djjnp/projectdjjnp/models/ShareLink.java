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
    private String userName;
    private String shareLink;
    
    public ShareLink() {
    }

    public ShareLink(int uid, String shareToken, LocalDateTime expirationTimestamp, String userName, String shareLink) {
        this.uid = uid;
        this.shareToken = shareToken;
        this.expirationTimestamp = expirationTimestamp;
        this.userName = userName;
        this.shareLink = shareLink;
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

    public int getShareid() {
        return shareid;
    }

    public void setShareid(int shareid) {
        this.shareid = shareid;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    @Override
    public String toString() {
        return "ShareLink [id=" + shareid + ", shareToken=" + shareToken + ", uid=" + uid + "]";
    }

    public String getShareLink() {
        return shareLink;
    }

    public void setShareLink(String shareLink) {
        this.shareLink = shareLink;
    }
    
}
