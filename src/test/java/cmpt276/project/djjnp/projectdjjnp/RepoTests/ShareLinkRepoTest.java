package cmpt276.project.djjnp.projectdjjnp.RepoTests;

import cmpt276.project.djjnp.projectdjjnp.models.ShareLink;
import cmpt276.project.djjnp.projectdjjnp.models.ShareLinkRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@DataJpaTest
public class ShareLinkRepoTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ShareLinkRepository shareLinkRepo;

    @Test
    public void testFindByShareid() {
        ShareLink linkOne = new ShareLink(1, "token1", LocalDateTime.now().plusDays(1), "User One", "link1");
        entityManager.persist(linkOne);
        entityManager.flush();

        ShareLink linkTwo = new ShareLink(2, "token2", LocalDateTime.now().plusDays(1), "User Two", "link2");
        entityManager.persist(linkTwo);
        entityManager.flush();

        List<ShareLink> foundLinkOne = shareLinkRepo.findByShareid(linkOne.getShareid());
        List<ShareLink> notFound = shareLinkRepo.findByShareid(999);

        // Verify the found link
        assertEquals(1, foundLinkOne.size());
        assertEquals("token1", foundLinkOne.get(0).getShareToken());
        assertEquals("User One", foundLinkOne.get(0).getUserName());

        // Verify no link found for invalid ID
        assertEquals(0, notFound.size());
    }

    @Test
    public void testFindByShareToken() {
        ShareLink linkOne = new ShareLink(1, "token1", LocalDateTime.now().plusDays(1), "User One", "link1");
        entityManager.persist(linkOne);
        entityManager.flush();

        ShareLink linkTwo = new ShareLink(2, "token2", LocalDateTime.now().plusDays(1), "User Two", "link2");
        entityManager.persist(linkTwo);
        entityManager.flush();

        ShareLink foundTokenOne = shareLinkRepo.findByShareToken("token1");
        ShareLink notFound = shareLinkRepo.findByShareToken("invalidToken");

        assertEquals(1, foundTokenOne.getUid());
        assertEquals("link1", foundTokenOne.getShareLink());

        // Verify no link found for invalid token
        assertEquals(null, notFound);
    }
}
