/**
 * DeletePage - Deletes pages
 * 
 * @author Blake Callens <blake@pencilblue.org>
 * @copyright PencilBlue 2014, All rights reserved
 */
function DeletePage(){}

//inheritance
util.inherits(DeletePage, pb.BaseController);

DeletePage.prototype.render = function(cb) {
	var self = this;
	
	var get = this.query;
    var message = this.hasRequiredParams(get, ['id']);
    if (message) {
        this.formError(message, '/admin/content/pages/manage_pages', cb);
        return;
    }
    
    var dao = new pb.DAO();
    dao.deleteMatching(get.id, 'page').then(function(pagesDeleted) {
        if(util.isError(pagesDeleted) || pagesDeleted <= 0) {
            self.formError('^loc_ERROR_SAVING^', '/admin/content/pages/manage_pages', cb);
            return;
        }
        session.success = page.headline + ' ^loc_DELETED^';
        cb(pb.RequestHandler.generateRedirect(pb.config.siteRoot + '/admin/content/pages/manage_pages'));
    });
};

DeletePage.init = function(request, output)
{
    var instance = this;

    getSession(request, function(session)
    {
        if(!userIsAuthorized(session, {logged_in: true, admin_level: ACCESS_EDITOR}))
        {
            formError(request, session, '^loc_INSUFFICIENT_CREDENTIALS^', '/admin/content/pages/manage_pages', output);
            return;
        }
        
        var get = getQueryParameters(request);
        
        if(message = checkForRequiredParameters(get, ['id']))
        {
            formError(request, session, message, '/admin/content/pages/manage_pages', output);
            return;
        }
        
        getDBObjectsWithValues({object_type: 'page', _id: ObjectID(get['id'])}, function(data)
        {
            if(data.length == 0)
            {
                formError(request, session, '^loc_ERROR_SAVING^', '/admin/content/pages/manage_pages', output);
                return;
            }
            
            var page = data[0];
            
            deleteMatchingDBObjects({object_type: 'page', _id: ObjectID(get['id'])}, function(success)
            {
                session.success = page.headline + ' ^loc_DELETED^';
                
                editSession(request, session, [], function(data)
                {        
                    output({redirect: pb.config.siteRoot + '/admin/content/pages/manage_pages'});
                });
            });
        });
    });
};

//exports
module.exports = DeletePage;