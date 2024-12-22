package cmpt276.project.djjnp.projectdjjnp.ControllerTests;

import java.util.Arrays;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;

import static org.mockito.BDDMockito.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import cmpt276.project.djjnp.projectdjjnp.controllers.EventController;
import cmpt276.project.djjnp.projectdjjnp.models.Event;

@RunWith(SpringRunner.class)
@WebMvcTest(EventController.class)
public class EventControllerTest {

        @Autowired
        private MockMvc mvc;

        @MockBean
        private EventController controller;

        @Test
        public void testGetAllEvents() throws Exception {
                Event event = new Event();
                event.setEventName("Test Event");

                List<Event> allEvents = Arrays.asList(event);

                given(controller.getEvents()).willReturn(allEvents);

                mvc.perform(get("/api/event")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].eventName", is(event.getEventName())));
        }

        @Test
        public void testGetEventsByUid() throws Exception {
                int correctUid = 1;
                int wrongUid = 20;

                Event correctEventOne = new Event();
                correctEventOne.setUid(correctUid);

                Event correctEventTwo = new Event();
                correctEventTwo.setUid(correctUid);

                Event correctEventThree = new Event();
                correctEventThree.setUid(correctUid);

                Event wrongEventOne = new Event();
                wrongEventOne.setUid(wrongUid);

                Event wrongEventTwo = new Event();
                wrongEventTwo.setUid(wrongUid);

                List<Event> correctList = Arrays.asList(correctEventOne, correctEventTwo, correctEventThree);
                List<Event> allList = Arrays.asList(correctEventOne, correctEventTwo, correctEventThree, wrongEventOne,
                                wrongEventTwo);

                given(controller.getEvents()).willReturn(allList);
                given(controller.getEventsByUserId(correctUid)).willReturn(correctList);

                // Check entire list first
                mvc.perform(get("/api/event")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(5)));

                // Check for event corresponding to uid
                mvc.perform(get("/api/event/" + Integer.toString(correctUid))
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(3)))
                                .andExpect(jsonPath("$[0].uid", is(correctUid)))
                                .andExpect(jsonPath("$[1].uid", is(correctUid)))
                                .andExpect(jsonPath("$[2].uid", is(correctUid)));

        }

        @Test
        public void testCalendarAdd() throws Exception {
                Event event = new Event(1, "Test Event", "49.2462", "-123.1162", 800, 900, "7/23/2023");

                given(controller.saveEvent(Mockito.any(Event.class)))
                                .willReturn(ResponseEntity.status(HttpStatus.CREATED).body(event));

                mvc.perform(post("/api/calendar/add")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(event)))
                                .andExpect(status().isCreated())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.uid", is(1)))
                                .andExpect(jsonPath("$.eventName", is("Test Event")))
                                .andExpect(jsonPath("$.latitude", is("49.2462")))
                                .andExpect(jsonPath("$.longitude", is("-123.1162")))
                                .andExpect(jsonPath("$.timeBegin", is(800)))
                                .andExpect(jsonPath("$.timeEnd", is(900)))
                                .andExpect(jsonPath("$.date", is("7/23/2023")));

        }

        @Test
        public void testDisplayAdd() throws Exception {
                Event event = new Event(1, "Test Event", "49.2462", "-123.1162", 800, 900, "7/23/2023");

                given(controller.saveMarker(Mockito.any(Event.class)))
                                .willReturn(ResponseEntity.status(HttpStatus.CREATED).body(event));

                mvc.perform(post("/api/display/add")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(event)))
                                .andExpect(status().isCreated())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.uid", is(1)))
                                .andExpect(jsonPath("$.eventName", is("Test Event")))
                                .andExpect(jsonPath("$.latitude", is("49.2462")))
                                .andExpect(jsonPath("$.longitude", is("-123.1162")))
                                .andExpect(jsonPath("$.timeBegin", is(800)))
                                .andExpect(jsonPath("$.timeEnd", is(900)))
                                .andExpect(jsonPath("$.date", is("7/23/2023")));

        }

        @Test
        public void testDeleteValidEvent() throws Exception {
                int testId = 0;
                int invalidId = 100;

                HttpHeaders header = new HttpHeaders();
                header.setContentType(MediaType.TEXT_PLAIN);

                when(controller.deleteEvent(testId))
                                .thenReturn(new ResponseEntity<>("Event deleted successfully.", header, HttpStatus.OK));
                when(controller.deleteEvent(invalidId))
                                .thenReturn(new ResponseEntity<>("Event not found.", header, HttpStatus.NOT_FOUND));

                // test for deleting valid id
                mvc.perform(delete("/api/{testId}", testId))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                                .andExpect(content().string("Event deleted successfully."));

                verify(controller).deleteEvent(testId);
        }

        @Test
        public void testDeleteInvalidEvent() throws Exception {
                int testId = 0;
                int invalidId = 100;

                HttpHeaders header = new HttpHeaders();
                header.setContentType(MediaType.TEXT_PLAIN);

                when(controller.deleteEvent(testId))
                                .thenReturn(new ResponseEntity<>("Event deleted successfully.", header, HttpStatus.OK));
                when(controller.deleteEvent(invalidId))
                                .thenReturn(new ResponseEntity<>("Event not found.", header, HttpStatus.NOT_FOUND));

                // test for trying to delete invalid id
                mvc.perform(delete("/api/{invalidId}", 100))
                                .andExpect(status().isNotFound())
                                .andExpect(content().contentType(MediaType.TEXT_PLAIN))
                                .andExpect(content().string("Event not found."));

                verify(controller).deleteEvent(invalidId);
        }
}
