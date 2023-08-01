package cmpt276.project.djjnp.projectdjjnp.models;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event,Integer>{
    List<Event> findByDate(String date);
    // List<Event> findByTimeBegin(int timeBegin);
    // List<Event> findByTimeEnd(int timeEnd);
    // List<Event> findByTimeBeginEnd(int timeBegin,int timeEnd);
    List<Event> findByUid(int uid);
    void deleteByUid(int uid);
}