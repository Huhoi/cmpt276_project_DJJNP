package cmpt276.project.djjnp.projectdjjnp.RepoTests;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import org.springframework.test.context.junit4.SpringRunner;


import static org.junit.Assert.assertEquals;

import java.util.List;

import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;


@RunWith(SpringRunner.class)
@DataJpaTest
public class UserRepoTest {
    
    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepo;

    @Test
    public void testFindAll(){
        User userOne = new User("User One", "password");
        entityManager.persist(userOne);
        entityManager.flush();

        User userTwo = new User("User Two", "password");
        entityManager.persist(userTwo);
        entityManager.flush();

        User userThree = new User("User Three", "password");
        entityManager.persist(userThree);
        entityManager.flush();

        List<User> allUsers = userRepo.findAll();

        assertEquals(3, allUsers.size());
        assertEquals("User One", allUsers.get(0).getEmail());
        assertEquals("User Two", allUsers.get(1).getEmail());
        assertEquals("User Three", allUsers.get(2).getEmail());
    }

    @Test
    public void testFindByEmail(){
        User userOne = new User("User One", "password");
        entityManager.persist(userOne);
        entityManager.flush();

        User userTwo = new User("User Two", "password");
        entityManager.persist(userTwo);
        entityManager.flush();

        User userThree = new User("User Three", "password");
        entityManager.persist(userThree);
        entityManager.flush();

        List<User> found = userRepo.findByEmail(userOne.getEmail());
        List<User> notFound = userRepo.findByEmail("Wrong email");

        assertEquals(1, found.size()); //Should only find one
        assertEquals("User One", found.get(0).getEmail());

        assertEquals(0, notFound.size()); //Should not find

    }

    @Test
    public void testFindByEmailAndPassword(){
        User userOne = new User("User One", "password");
        entityManager.persist(userOne);
        entityManager.flush();

        User userTwo = new User("User Two", "password");
        entityManager.persist(userTwo);
        entityManager.flush();

        User userThree = new User("User Three", "password");
        entityManager.persist(userThree);
        entityManager.flush();

        List<User> found = userRepo.findByEmailAndPassword(userOne.getEmail(), userOne.getPassword());
        List<User> wrongEmail = userRepo.findByEmailAndPassword("Wrong User", "password");
        List<User> wrongPass = userRepo.findByEmailAndPassword("User One", "wrongPass");
        List<User> wrongBoth = userRepo.findByEmailAndPassword("Wrong User", "wrongPass");

        assertEquals(1, found.size()); //Should find one
        assertEquals("User One", found.get(0).getEmail()); //check if email is correct
        assertEquals("password", userOne.getPassword()); //check if pass is correct

        //shouldn't find any
        assertEquals(0, wrongEmail.size());
        assertEquals(0, wrongPass.size());
        assertEquals(0, wrongBoth.size());
    }

    @Test
    public void testFindByUid(){
        User userOne = new User("User One", "password");
        entityManager.persist(userOne);
        entityManager.flush();

        User userTwo = new User("User Two", "password");
        entityManager.persist(userTwo);
        entityManager.flush();

        User userThree = new User("User Three", "password");
        entityManager.persist(userThree);
        entityManager.flush();

        List<User> foundUserOne = userRepo.findByUid(userOne.getUid());
        List<User> foundUserTwo = userRepo.findByUid(userTwo.getUid());
        List<User> foundUserThree = userRepo.findByUid(userThree.getUid());
        List<User> notFound = userRepo.findByUid(100);

        //should find one user for each list generated
        assertEquals(1, foundUserOne.size());
        assertEquals(1, foundUserTwo.size());
        assertEquals(1, foundUserThree.size());

        //should not find any
        assertEquals(0, notFound.size());

        //check uid, entityManager starts it at 10 for some reason
        assertEquals(10, foundUserOne.get(0).getUid());
        assertEquals(11, foundUserTwo.get(0).getUid());
        assertEquals(12, foundUserThree.get(0).getUid());

        //check emails are correct
        assertEquals("User One", foundUserOne.get(0).getEmail());
        assertEquals("User Two", foundUserTwo.get(0).getEmail());
        assertEquals("User Three", foundUserThree.get(0).getEmail());

        //check passwords are correct
        assertEquals("password", foundUserOne.get(0).getPassword());
        assertEquals("password", foundUserTwo.get(0).getPassword());
        assertEquals("password", foundUserThree.get(0).getPassword());

    }
}
