package cmpt276.project.djjnp.projectdjjnp.service;

import cmpt276.project.djjnp.projectdjjnp.models.ShareLink;

public interface ShareLinkService {
    public void saveShareLink(ShareLink ShareLink);

    public ShareLink getShareLinkByToken(String shareToken);

    public int getDataFromShareLink(ShareLink ShareLink);
}
