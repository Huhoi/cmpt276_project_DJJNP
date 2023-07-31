package cmpt276.project.djjnp.projectdjjnp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cmpt276.project.djjnp.projectdjjnp.models.ShareLink;
import cmpt276.project.djjnp.projectdjjnp.models.ShareLinkRepository;

@Service
public class ShareLinkServiceImplementation implements ShareLinkService{
    private final ShareLinkRepository shareLinkRepo;

    @Autowired
    public ShareLinkServiceImplementation(ShareLinkRepository shareLinkRepo) {
        this.shareLinkRepo = shareLinkRepo;
    }

    public void saveShareLink(ShareLink ShareLink){
        shareLinkRepo.save(ShareLink);
    }


    public ShareLink getShareLinkByToken(String shareToken) {
        return shareLinkRepo.findByShareToken(shareToken);
    }   

    public int getUidFromShareLink(ShareLink shareLink) {
        return shareLink.getUid();
    }

    public String getUserNameFromShareLink(ShareLink shareLink){
        return shareLink.getUserName();
    }

    public String getShareTokenFromShareLink(ShareLink shareLink){
        return shareLink.getShareToken();
    }

}
