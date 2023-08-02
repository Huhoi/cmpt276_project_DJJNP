package cmpt276.project.djjnp.projectdjjnp.RepoTests;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import org.springframework.test.context.junit4.SpringRunner;


import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;

import cmpt276.project.djjnp.projectdjjnp.models.Event;
import cmpt276.project.djjnp.projectdjjnp.models.EventRepository;


@RunWith(SpringRunner.class)
@DataJpaTest
public class EventRepoTest{

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EventRepository eventRepo;

    @Test
    public void testFindByEventName() {

        Event testEvent = new Event();
        testEvent.setEventName("Test Event");
        entityManager.persist(testEvent);
        entityManager.flush();

        Event found = eventRepo.findByEventName(testEvent.getEventName());

        assertEquals(found.getEventName(), testEvent.getEventName());
    }

    @Test
    public void testFindByDate() {

        List<Event> eventList = new ArrayList<>();
        String correctDate = "7/23/2023";
        String wrongDate = "8/12/2024";

        Event testOne = new Event();
        testOne.setDate(correctDate);
        entityManager.persist(testOne);
        entityManager.flush();

        Event testTwo = new Event();
        testTwo.setDate(correctDate);
        entityManager.persist(testTwo);
        entityManager.flush();

        Event testThree = new Event();
        testThree.setDate(correctDate);
        entityManager.persist(testThree);
        entityManager.flush();

        Event testFour = new Event();
        testFour.setDate(correctDate);
        entityManager.persist(testFour);
        entityManager.flush();

        Event wrongDateEvent = new Event();
        wrongDateEvent.setDate(wrongDate);
        entityManager.persist(wrongDateEvent);
        entityManager.flush();

        eventList.add(testOne);
        eventList.add(testTwo);
        eventList.add(testThree);
        eventList.add(testFour);
        eventList.add(wrongDateEvent);

        List<Event> found = eventRepo.findByDate(correctDate);
        assertEquals(4, found.size()); //expect 4 elements, not 5

        for (int i = 0; i < found.size(); i++){
            assertEquals(correctDate, found.get(i).getDate());
        }
    }

    @Test
    public void testFindByUid() {

        List<Event> eventList = new ArrayList<>();
        int correctUid = 5;
        int wrongUid = 777;

        Event testOne = new Event();
        testOne.setUid(correctUid);
        entityManager.persist(testOne);
        entityManager.flush();

        Event testTwo = new Event();
        testTwo.setUid(correctUid);
        entityManager.persist(testTwo);
        entityManager.flush();

        Event testThree = new Event();
        testThree.setUid(correctUid);
        entityManager.persist(testThree);
        entityManager.flush();

        Event testFour = new Event();
        testFour.setUid(correctUid);
        entityManager.persist(testFour);
        entityManager.flush();

        Event wrongDateEvent = new Event();
        wrongDateEvent.setUid(wrongUid);
        entityManager.persist(wrongDateEvent);
        entityManager.flush();

        eventList.add(testOne);
        eventList.add(testTwo);
        eventList.add(testThree);
        eventList.add(testFour);
        eventList.add(wrongDateEvent);

        List<Event> found = eventRepo.findByUid(correctUid);
        assertEquals(4, found.size()); //expect 4 elements, not 5

        for (int i = 0; i < found.size(); i++){
            assertEquals(correctUid, found.get(i).getUid());
        }
    }
}