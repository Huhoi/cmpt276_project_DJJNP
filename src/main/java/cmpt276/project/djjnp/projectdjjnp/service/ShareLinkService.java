package cmpt276.project.djjnp.projectdjjnp.service;

import cmpt276.project.djjnp.projectdjjnp.models.ShareLink;

public interface ShareLinkService {
    public void saveShareLink(ShareLink ShareLink);

    public ShareLink getShareLinkByToken(String shareToken);

    public int getUidFromShareLink(ShareLink shareLink);

    public String getUserNameFromShareLink(ShareLink shareLink);

    public String getShareTokenFromShareLink(ShareLink shareLink);
}
