package cmpt276.project.djjnp.projectdjjnp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cmpt276.project.djjnp.projectdjjnp.models.User;
import cmpt276.project.djjnp.projectdjjnp.models.UserRepository;

@Service
public class UserServiceImplementation implements UserService{
    
    @Autowired
    private UserRepository userRepo;

    @Override
    public void registerUser(User user){
        userRepo.save(user);
    }
    
}
