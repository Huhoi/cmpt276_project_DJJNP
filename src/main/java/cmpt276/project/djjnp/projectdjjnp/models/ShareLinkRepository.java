package cmpt276.project.djjnp.projectdjjnp.models;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShareLinkRepository extends JpaRepository<ShareLink, Integer> {
    List<ShareLink> findByShareid(int shareid);
    ShareLink findByShareToken(String shareToken);
}
