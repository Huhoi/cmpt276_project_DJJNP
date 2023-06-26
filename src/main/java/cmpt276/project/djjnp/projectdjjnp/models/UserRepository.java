package cmpt276.project.djjnp.projectdjjnp.models;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Integer>{
    User findByEmail(String email);
    List<User> findByEmailAndPassword(String email, String password);
    List<User> findByUid(int uid);
}
