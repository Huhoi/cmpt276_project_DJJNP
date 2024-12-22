package cmpt276.project.djjnp.projectdjjnp.ModelTests;

import cmpt276.project.djjnp.projectdjjnp.models.ShareLink;
import cmpt276.project.djjnp.projectdjjnp.models.ShareLinkRepository;
import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.service.ShareLinkService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ShareLinkTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ShareLinkService shareLinkService;

    @MockBean
    private ShareLinkRepository shareLinkRepository;

    private MockHttpSession session;

    private ShareLink validShareLink;

    private ShareLink expiredShareLink;

    @BeforeEach
    public void setup() {
        User testUser = new User();
        testUser.setUid(1);
        testUser.setEmail("test@example.com");

        session = new MockHttpSession();
        session.setAttribute("sessionUser", testUser);

        validShareLink = new ShareLink();
        validShareLink.setUid(1);
        validShareLink.setShareToken("validToken");
        validShareLink.setExpirationTimestamp(LocalDateTime.now().plusMinutes(10));
        validShareLink.setUserName("test@example.com");

        expiredShareLink = new ShareLink();
        expiredShareLink.setUid(1);
        expiredShareLink.setShareToken("expiredToken");
        expiredShareLink.setExpirationTimestamp(LocalDateTime.now().minusMinutes(10));
        expiredShareLink.setUserName("test@example.com");
    }

    @Test
    public void testGenerateShareLink() throws Exception {
        mockMvc.perform(get("/share").session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/calendar"));
    }

    @Test
    public void testHandleShareLink_ValidToken() throws Exception {
        when(shareLinkService.getShareLinkByToken(anyString())).thenReturn(validShareLink);

        mockMvc.perform(get("/share/validToken"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/shareSuccess/validToken"));
    }

    @Test
    public void testHandleShareLink_ExpiredToken() throws Exception {
        when(shareLinkService.getShareLinkByToken(anyString())).thenReturn(expiredShareLink);

        mockMvc.perform(get("/share/expiredToken"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/shareError"));
    }

    @Test
    public void testShareSuccess() throws Exception {
        when(shareLinkService.getShareLinkByToken("validToken")).thenReturn(validShareLink);
        when(shareLinkService.getUidFromShareLink(validShareLink)).thenReturn(1);
        when(shareLinkService.getUserNameFromShareLink(validShareLink)).thenReturn("test@example.com");

        mockMvc.perform(get("/shareSuccess/validToken"))
                .andExpect(status().isOk())
                .andExpect(view().name("view/shareSuccess"))
                .andExpect(model().attributeExists("shareLink", "shareUid", "shareUserName"));
    }

    @Test
    public void testShareError() throws Exception {
        mockMvc.perform(get("/shareError"))
                .andExpect(status().isOk())
                .andExpect(view().name("view/expiredShareLink"));
    }
}
