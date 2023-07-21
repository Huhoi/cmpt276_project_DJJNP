package cmpt276.project.djjnp.projectdjjnp.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cmpt276.project.djjnp.projectdjjnp.models.Location;
import cmpt276.project.djjnp.projectdjjnp.models.LocationRepository;


@RestController
@RequestMapping("/api")
public class LocationController {

    @Autowired(required = true)
    private LocationRepository locationRepo;

    @GetMapping("/location")
    public List<Location> getLocations(){
        if (locationRepo.count() > 0){
            return locationRepo.findAll();
        }
        
        return null;
    }
}
